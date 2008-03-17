class LogEntry < ActiveRecord::Base
  belongs_to  :task
  
  validates_presence_of :task_id
  
  after_save :update_duration_cache
  
  def update_duration_cache
    task.duration_cache = task.duration + (created_at - task.last_start.created_at) if action == "stop" 
    task.save!
  end
end
