class UsersController < ApplicationController
  skip_filter :authenticate
  
  def new
    @user = flash[:user] || User.new
    render :layout => false
  end
  
  def create
    @user = User.create(params[:user])
    if @user.valid?
      session[:user_id] = @user.id
      redirect_to :controller => "task_lists"
    else
      flash[:user] = @user
      flash[:notice] = "Error creating user"
      redirect_to :controller => "users", :action => "new"
    end
  end
end
