# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time
  #model :user
  
  before_filter :authenticate

  # See ActionController::RequestForgeryProtection for details
  # Uncomment the :secret if you're not using the cookie session store
  protect_from_forgery # :secret => '802b79411056382c0ae6a6e233fa0a34'
  
  protected

    def authenticate
      unless session[:user_id]
        redirect_to :controller => "session", :action => "new"
        return false
      end
    end
    
    def check_obj_rights(klass, owner_path)
      obj = klass.find(params[:id])
      if obj == nil or eval("obj.#{owner_path}") != current_user
        render :file => "#{RAILS_ROOT}/public/422.html", :status => 422
        return false
      end
    end
    
    def current_user
      User.find(session[:user_id]) if session[:user_id]
    end

end
