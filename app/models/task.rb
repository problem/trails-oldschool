class Task < ActiveRecord::Base
  composed_of :specific_rate, :class_name => "Money", :mapping => [%w(rate_cents cents), %w(currency currency)], :allow_nil=>true
  has_many    :log_entries, :order=>"created_at ASC"
  belongs_to  :task_list
  
  validates_presence_of :task_list_id, :description
  
  STATUS_MAP = {
    "start"     => :active,
    "stop"      => :stopped,
    "complete"  => :complete,
    "reopen"    => :stopped
  }
  
  def last_entry
    log_entries.last
  end
  
  def status
    # return :stopped unless last_entry
    # STATUS_MAP[log_entries.first.action]
    @status ||= [:active, :stopped, :complete][rand(3)]
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

  
end
