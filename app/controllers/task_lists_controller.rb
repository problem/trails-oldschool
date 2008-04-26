class TaskListsController < ApplicationController
  before_filter :check_rights, :only => [:update, :destroy]
  
  def index
    @task_lists = TaskList.find(:all, :conditions=> {:owner_id=>session[:user_id]}, :order=>"updated_at DESC")
  end
  
  def create
    @task_list = TaskList.create!(params[:task_list].merge(:owner_id=>session[:user_id]))
    render :partial => @task_list
  end
  
  def update
    @task_list = TaskList.update(params[:id], params[:task_list])
    render :partial=>"task_lists/header", :object=>@task_list
  end
  
  def destroy
    TaskList.destroy(params[:id])
    head :ok
  end
  
  private
    def check_rights
      check_obj_rights(TaskList, "owner")
    end

end
