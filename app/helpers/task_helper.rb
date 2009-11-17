module TaskHelper
  def task_status(task)
    case (status = task.status)
    when :stopped:
      tag :input, :type=>"checkbox", :value=>status, :id=>dom_id(task, status), :class=>dom_class(task, status)
    when :complete:
      tag :input, :type=>"checkbox", :value=>status, :id=>dom_id(task, status), :class=>dom_class(task, status), :checked=>true
    when :active:
      link_to image_tag("task_in_progress.gif", :id=>dom_id(task, status), :class=>dom_class(task, status))
    end
  end
  
  def task_action_button(task)
    case (status = task.status)
    when :stopped:
      link_to "Start", '#', :id=>dom_id(task, :start), :class=>dom_class(task, :start)
    when :active:
      link_to "Stop", '#', :id=>dom_id(task, :stop), :class=>dom_class(task, :stop)
    when :complete:
      "&nbsp;"
    end
  end
  
  def task_rate(task)
    content_tag :span, task.rate.format(:minimal) + "/h", :class=>(task.specific_rate? ? "specfic" : "inherited")
  end
  
  
  #def task_duration(task)
  #  if task.duration > 60 || task.status == :active
  #    duration(task.duration) 
  #  elsif task.duration > 0 
  #    %Q|#{task.duration}<span class="fade">s</span>|
  #  end
  #end
  
  def task_earnings(task)
     task.earnings.format(:accurate) if task.earnings?
  end
  
end