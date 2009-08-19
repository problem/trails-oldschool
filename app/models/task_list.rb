class TaskList < ActiveRecord::Base
  has_many    :tasks, :dependent=>:destroy, :after_add=>:update_ordering_for_new_task
  belongs_to  :owner, :class_name => "User"
  composed_of :actual_default_rate, :class_name => "Money", :mapping => [%w(default_rate_cents cents), %w(default_currency currency)], :allow_nil=>true
  validates_presence_of :title, :actual_default_rate
  before_save :save_task_order
  include ApplicationHelper
  
  def default_rate
    actual_default_rate or ((last_list = TaskList.find(:first, :order=>"updated_at DESC")) and last_list.default_rate) or 0.to_money
  end
  
  def default_rate=(rate)
    self.actual_default_rate = rate.to_money
  end
  
  def running_tasks
    running = []
    task_order.each do |task_id|
      task = tasks.find(task_id)
      running << task if task.running?
    end
    running
  end
  
  def sorted_tasks
    active = []
    completed = []
    task_order.each do |task_id|
      task = tasks.find(task_id)
      next if task.new_record?
      active << task if task.active?
      completed << task if task.completed?
    end
    active + completed
  end
  
  def earnings
    tasks.to_a.sum(&:earnings).to_money
  end
  
  def duration
    tasks.to_a.sum(&:running_time)
  end
  
  def task_order
    @task_order ||= ((ord=read_attribute(:task_order)) && ord.split(',')) || []
  end
  
  def task_order=(order)
    @task_order = order
  end
  
  def task_list_earnings
    earnings.format(:accurate)
  end
  
  def task_list_duration
    formatted_duration(duration)
  end
  
  
  private
  
  def save_task_order
    write_attribute(:task_order, self.task_order.join(','))
  end
  
  def update_ordering_for_new_task(new_task)
    self.task_order.unshift(new_task.id) if new_task.id
  end
  
end
