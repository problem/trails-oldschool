class TaskListsController < ApplicationController
  def index
    @task_lists = TaskList.find(:all, :order=>"updated_at DESC")
  end
  def create
    @task_list = TaskList.create!(params["task_list"])
    render :partial => @task_list
  end
end