class TasksController < ApplicationController
  def create
    @task = TaskList.find(params[:task_list_id]).tasks.create(params[:task])
    render :partial=>@task
  end
  
  def update
    @task = Task.update(params[:id],params[:task])
    render :partial=>@task
  end
  
  def destroy
    Task.destroy(params[:id])
    head :ok
  end
end