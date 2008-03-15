class Command < ActiveRecord::Base
  has_one :user, :foreign_key => "last_command_id"
  
  serialize :original_object
end
