module TaskHelper
  def task_status(task)
    case (status = task.status)
    when :stopped:
      tag :input, :type=>"checkbox", :value=>status, :id=>dom_id(task, :status)
    when :complete:
      tag :input, :type=>"checkbox", :value=>status, :id=>dom_id(task, :status), :checked=>true
    when :active:
      link_to image_tag("task_in_progress.png")
    end
  end
  
  def task_action_button(task)
    case (status = task.status)
    when :stopped:
      link_to "Start", '#', :id=>dom_id(task, :start)
    when :active:
      link_to "Stop", '#', :id=>dom_id(task, :stop)
    when :complete:
      "&nbsp;"
    end
  end
  
  def task_rate(task)
    content_tag :span, task.rate.format(:minimal) + "/h", :class=>(task.specific_rate? ? "specfic" : "inherited")
  end
  
  def task_active_class(task)
    {:class=>if task.active? then "active" else "completed" end}
  end
  
end