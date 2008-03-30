class TaskListsController < ApplicationController
  def index
    @task_lists = TaskList.find(:all, :order=>"updated_at DESC")
  end
  def create
    @tl = TaskList.new(params["task_list"])
    puts @tl.inspect
    @tl.save!
    render :partial => @tl, :object=>@tl
  end
end