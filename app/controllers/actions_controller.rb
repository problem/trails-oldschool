class ActionsController < ApplicationController
  def create
    @task = Task.find(params[:task_id])
    @task.add_action(params[:log_entry])
    render :partial=>@task
  end
end