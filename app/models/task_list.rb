class TaskList < ActiveRecord::Base
  has_many    :tasks
  belongs_to  :owner, :class_name => "User"
  
  validates_presence_of :title
end
