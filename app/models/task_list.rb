class TaskList < ActiveRecord::Base
  has_many    :tasks
  belongs_to  :owner, :class_name => "User"
  composed_of :default_rate, :class_name => "Money", :mapping => [%w(default_rate_cents cents), %w(default_currency currency)]
  
  validates_presence_of :title
  
  def active_tasks
    tasks.select(&:active?)
  end
  
  def completed_tasks
    tasks.select(&:completed?)
  end
  
end
