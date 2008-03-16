class Task < ActiveRecord::Base
  has_many    :log_entries, :order=>"created_at DESC"
  belongs_to  :task_list
  
  validates_presence_of :task_list_id, :description
  
  STATUS_MAP = Hash.new(:stopped)
  STATUS_MAP["start"] = :active
  STATUS_MAP["stop"] = :stopped
  STATUS_MAP["complete"] = :complete
  STATUS_MAP["reopen"] = :stopped
  
  def status
    STATUS_MAP[log_entries.first.type]
    @status ||= [:active, :stopped, :complete][rand(3)]
  end
  
  def completed?
    status == :complete
  end
  
  def active?
    status == :stopped or status == :active
  end
end
