class UserObserver < ActiveRecord::Observer
  
  def after_create(user)
    # Send welcome email
  end
  
end
