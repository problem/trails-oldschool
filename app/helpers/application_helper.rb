# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  def user
    # @user ||= User.find(session[:user_id])
    @user ||= User.find(:first)
  end
end
