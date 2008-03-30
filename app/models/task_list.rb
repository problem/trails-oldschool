class TaskList < ActiveRecord::Base
  has_many    :tasks, :dependent=>:destroy
  belongs_to  :owner, :class_name => "User"
  composed_of :actual_default_rate, :class_name => "Money", :mapping => [%w(default_rate_cents cents), %w(default_currency currency)], :allow_nil=>true
  
  validates_presence_of :title, :actual_default_rate
  
  def default_rate
    actual_default_rate or ((last_list = TaskList.find(:first, :order=>"updated_at DESC")) and last_list.default_rate) or 0.to_money
  end
  
  def default_rate=(rate)
    self.actual_default_rate = rate.to_money
  end
  
  def sorted_tasks
    tasks.select(&:active?).reject(&:new_record?) + tasks.select(&:completed?)
  end
  
  def earnings
    tasks.to_a.sum(&:earnings).to_money
  end
  
  def duration
    tasks.to_a.sum(&:duration)
  end
  
end
