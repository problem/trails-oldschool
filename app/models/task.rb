class Task < ActiveRecord::Base
  has_many    :log_entries
  belongs_to  :task_list
  
  validates_presence_of :task_list_id, :description
end
