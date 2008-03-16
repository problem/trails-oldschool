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
end
