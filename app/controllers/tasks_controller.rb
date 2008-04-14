class TasksController < ApplicationController
  def create
    task_list = TaskList.find(params[:task_list_id])
    @task = task_list.tasks.create(params[:task])
    task_list.save!
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