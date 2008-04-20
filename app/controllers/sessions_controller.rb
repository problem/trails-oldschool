class SessionsController < ApplicationController
  skip_filter :authenticate
  
  def create
    info = params[:login]
    session[:user] = User.authenticate(info[:email], info[:password])
    if session[:user]
      redirect_to :controller => "task_lists"
    else
      flash[:notice] = "Incorrect user name or password"
      redirect_to :controller => "session", :action => "new"
    end
  end
  
  def destroy
    reset_session
    redirect_to '/'
  end
end
