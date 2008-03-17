class Task < ActiveRecord::Base
  composed_of :specific_rate, :class_name => "Money", :mapping => [%w(rate_cents cents), %w(currency currency)], :allow_nil=>true
  has_many    :log_entries, :order=>"created_at DESC"
  has_one     :last_start, :class_name=>"LogEntry", :order=>"created_at DESC", :conditions=>"action = 'start'"
  belongs_to  :task_list
  
  validates_presence_of :task_list_id, :description
  
  STATUS_MAP = {
    "start"     => :active,
    "stop"      => :stopped,
    "complete"  => :complete,
    "reopen"    => :stopped
  }
  
  def add_action(action)
    action_name = action[:action]
    #do nothing if the new action won't change our status
    return if STATUS_MAP[action_name] == status
    case status
    when :active:
    when :stopped:
    when :complete:
    end
    log_entries.create(action)
    reload
  end
  
  def last_entry
    log_entries.last
  end
  
  def status
    return :stopped unless last_entry
    STATUS_MAP[log_entries.first.action]
    # @status ||= [:active, :stopped, :complete][rand(3)]
  end
  
  def completed?
    status == :complete
  end
  
  def active?
    status == :stopped or status == :active
  end
  
  def specific_rate?
    rate_cents?
  end
  
  def rate
    (specific_rate? && specific_rate) or task_list.default_rate
  end
  
  def duration
    duration_cache || 0
  end
  
  
  def earnings
    rate * (duration.to_f/(60*60))
  end
  
  def earnings?
    earnings.cents > 0
  end
  


  
end
