class TaskListsController < ApplicationController
  before_filter :check_rights, :only => [:update, :destroy]
  include ApplicationHelper
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
  
  def setTasksSequence
    #unlink all tasks from task_list
    @tasks_to_unlink = Task.all(:conditions=> "task_list_id = #{params[:id]}")
    @tasks_to_unlink.each do |task_id|
      @task = Task.find(task_id)
      #remove  task_list_id for each task
      @task.update_attributes("task_list_id" => 0)
    end
    
    #get list of tasks to be modified
    @tasks = params[:tasks].split(",")
    @tasks.each do |task_id|
      @task = Task.find(task_id)
      #assign new task_list_id to each task
      @task.update_attributes("task_list_id" => params[:id])
    end
    @task_list = TaskList.find(params[:id])
    #modify task_list task_order
    @task_list.update_attributes("task_order" => @tasks)
    render(:update) do |page|
      page["task_list_earnings_#{@task_list.id}"].replace_html @task_list.earnings.format(:accurate)
      page["task_list_duration_#{@task_list.id}"].replace_html formatted_duration(@task_list.duration)
    end
  end
  
  def refreshActiveTasks
    @jsonTasks = []
    @task_lists = TaskList.find(:all, :conditions=> {:owner_id=>session[:user_id]}, :order=>"updated_at DESC")
    @task_lists.each do |task_list_id|
      @task_list = TaskList.find(task_list_id)
      @tasks = @task_list.running_tasks
      @tasks.each do |task|
        @jsonTasks << task
      end
    end
    total_duration = formatted_duration(@task_lists.sum(&:duration))
    total_earnings = @task_lists.sum(&:earnings).to_money.format(:accurate)
    json_tasks = @jsonTasks.to_json(:only=>:id,:methods=>[:task_duration,:task_earnings,:task_duration_bar])
    json_task_lists = @task_lists.to_json(:only=>:id,:methods=>[:task_list_duration,:task_list_earnings])
    render :json => {:tasklists => json_task_lists,:tasks => json_tasks,:total_duration => total_duration,:total_earnings => total_earnings}
    #render :json => @jsonTasks.to_json(:only=>:id,:methods=>[:task_duration,:task_earnings,:task_duration_bar])
  end
  
  private
    def check_rights
      check_obj_rights(TaskList, "owner")
    end

end
