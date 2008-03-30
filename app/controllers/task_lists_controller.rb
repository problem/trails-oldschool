class TaskListsController < ApplicationController
  def index
    @task_lists = TaskList.find(:all, :order=>"updated_at DESC")
  end
  def create
    @task_list = TaskList.create!(params[:task_list])
    render :partial => @task_list
  end
  def update
    @task_list = TaskList.update(params[:id],params[:task_list])
    render :partial=>"task_lists/header", :object=>@task_list
  end
  def destroy
    TaskList.destroy(params[:id])
    head :ok
  end
end