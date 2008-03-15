class LogEntry < ActiveRecord::Base
  belongs_to  :task
  
  validates_presence_of :task_id
end
