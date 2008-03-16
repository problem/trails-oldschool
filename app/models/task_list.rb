class TaskList < ActiveRecord::Base
  has_many    :tasks
  belongs_to  :owner, :class_name => "User"
  
  validates_presence_of :title
  
  def active_tasks
    tasks.select(&:active?)
  end
  
  def completed_tasks
    tasks.select(&:completed?)
  end
  
end
