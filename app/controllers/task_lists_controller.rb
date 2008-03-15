class TaskListsController < ApplicationController
  def index
    @task_lists = TaskList.find(:all)
  end
end