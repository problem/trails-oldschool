# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  def user
    # @user ||= User.find(session[:user_id])
    @user ||= User.find(:first)
  end

  def duration(seconds)
    minutes = seconds / 60
    hours   = minutes / 60
    minutes = minutes % 60
    ("%02d:%02d"%[hours,minutes]).sub(/([0:]+)/,%q{<span class="fade">\1</span>})
  end

  def act_as_form(*args)
    url = polymorphic_path(args.dup)
    obj = args.pop
    action = obj.new_record? ? 'new' : 'edit'
    attrs = {}
    attrs[:class] = "#{dom_class(obj)} controller form #{action}"
    attrs[:id] = (args.collect{|o|dom_id(o)} << dom_id(obj, action)).join('_')
    attrs[:style] = "display:none;"
    attrs[:method] = obj.new_record? ? 'post' : 'put'
    attrs[:action] = url
    attrs
  end
end
