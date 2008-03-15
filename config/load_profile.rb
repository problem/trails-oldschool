# This module allows per-developer configuration of the app.
# 
# 
# Callback order:
#   preinitialize -> preconfig* -> config* -> initialize
#  
#  * these callbacks pass around the config object as an argument



# script/console and some other tools for some reason never load this helper
# method before running env.rb, so we define it in order to get non-bitchy local configs
unless respond_to?(:silence_warnings)
  def silence_warnings 
    old_verbose, $VERBOSE = $VERBOSE, nil 
    yield 
  ensure 
    $VERBOSE = old_verbose 
  end
end

require 'erb'
require 'yaml'
require'pathname'

module LoadProfile
  class << self
    def load!
      @callbacks = Hash.new { |hash, key|  hash[key]=[]}
      if init_file.exist?
        require init_file
      end
    end
    def on(callback_name, *enviornments, &block)
      if enviornments.empty? or enviornments.include?((RAILS_ENV || ENV['RAILS_ENV']).to_sym)
        @callbacks[callback_name] << block
      end

    end
    def username
      @username ||= if config_file.exist?
        config[:developer][:username]
      elsif ENV['USER'] && !ENV['USER'].empty?
        puts "-- LoadProfile: No developer.yml found - assuming profile name from $USER: #{ENV['USER'].inspect}"
        ENV['USER']
      else
        fail "LoadProfile: You must create config/developer.yml (or at least make sure ENV['USER'] is set)"
      end
    end
    def config
      YAML::load(ERB.new(config_file.read).result)
    end

    def perform(callback_name, callback_arg = nil)
      perform_config(callback_arg) if callback_name == :config
      @callbacks[callback_name].each{|c|c.call(callback_arg)} 
    end
    
    private
    
    def env
      ENV['RAILS_ENV']
    end
    
    def perform_config(conf)
      fail "LoadProfile: You must create #{db_config_file}" unless db_config_file.exist?
      conf.database_configuration_file = db_config_file.to_s
    end
    
    def root
      @root ||= Pathname.new(RAILS_ROOT)
    end
    
    def config_file
      root.join('config', 'developer.yml')
    end
    
    def db_config_file
      root.join('config', 'profiles', "database-#{username}.yml")
    end
    
    def init_file
      root.join('config', 'profiles', "init-#{username}.rb")
    end
    
  end
end

LoadProfile.load!

LoadProfile::perform(:preinitialize)