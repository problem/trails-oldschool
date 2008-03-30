class TaskList < ActiveRecord::Base
  has_many    :tasks
  belongs_to  :owner, :class_name => "User"
  composed_of :default_rate, :class_name => "Money", :mapping => [%w(default_rate_cents cents), %w(default_currency currency)]
  
  validates_presence_of :title
  
  def sorted_tasks
    tasks.select(&:active?).reject(&:new_record?) + tasks.select(&:completed?)
  end
  
  def earnings
    tasks.to_a.sum(&:earnings)
  end
  
  def duration
    tasks.to_a.sum(&:duration)
  end
  
end
