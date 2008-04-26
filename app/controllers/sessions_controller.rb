class SessionsController < ApplicationController
  skip_filter :authenticate
  
  def create
    info = params[:session]
    user = User.authenticate(info[:email], info[:password])
    if user
      session[:user_id] = user.id
      redirect_to :controller => "task_lists"
    else
      session[:user_id] = nil
      flash[:notice] = "Incorrect user name<br />or password. <br /><span class='please'>Please try again.</span>"
      redirect_to :controller => "session", :action => "new"
    end
  end
  
  def destroy
    reset_session
    redirect_to '/'
  end
end
