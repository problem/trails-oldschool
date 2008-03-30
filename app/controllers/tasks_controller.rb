class TasksController < ApplicationController
  def create
    @task = TaskList.find(params[:task_list_id]).tasks.create(params[:task])
    render :partial=>@task
  end
end