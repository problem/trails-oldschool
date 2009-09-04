class Task < ActiveRecord::Base
  composed_of :specific_rate, :class_name => "Money", :mapping => [%w(rate_cents cents), %w(currency currency)], :allow_nil=>true
  has_many    :log_entries, :order=>"created_at DESC",  :dependent=>:destroy
  has_one     :last_start, :class_name=>"LogEntry", :order=>"created_at DESC", :conditions=>"action = 'start'"
  belongs_to  :task_list
  include ApplicationHelper
  
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
  
  def running?
    status == :active
  end
  
  def specific_rate?
    rate_cents?
  end
  
  #if rate is negative then use default rate
  #else use specific_rate (value of 0 is now valid)
  def rate
    if(specific_rate?)
      if(rate_cents < 0)
        task_list.default_rate
      else
        specific_rate
      end
    else
      Money.new(0, "USD")
    end
  end

  def rate=(value)
    self.specific_rate = value.to_money if value
  end
  
  def duration
    duration_cache || 0
  end
  
  
  def earnings
    rate * (running_time.to_f/(60*60))
  end
  
  def earnings?
    earnings.cents > 0
  end
  
  def running_time
    if(running?)
      Time.now - last_start.created_at + duration
    else
      duration
    end
  end
  
  def updateDiffTime(difftime)
    new_time = duration + difftime*60
    if(new_time < 0)
      new_time = 0
    end
    return new_time
  end

  #not quite sure why task_duration(task) exists as a helper method
  #i believe it should be an object method and
  #therefore will be moved here
  def task_duration
    if status == :active
      formatted_duration(running_time) 
    elsif status == :stopped
      formatted_duration(duration)
    end
  end
  
  #same for task_earnings (see task_duration)   
  def task_earnings
     earnings.format(:accurate) if earnings?
  end
 
  def task_duration_bar
    %Q|<div class="duration_bar" style="width:#{[700,running_time/60].min.ceil}px"></div>|
  end
  
end
