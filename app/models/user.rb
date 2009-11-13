class User < ActiveRecord::Base
  has_many    :task_lists, :foreign_key => "owner_id",  :dependent=>:destroy
  belongs_to  :last_command, :class_name => "Command"
  
  validates_presence_of     :email #, :display_name
  validates_uniqueness_of   :email, :case_sensitive => false
  validates_length_of       :email, :within => 3..100
  validates_format_of       :email, :with => /^\S+\@(\[?)[a-zA-Z0-9\-\.]+\.([a-zA-Z]{2,4}|[0-9]{1,4})(\]?)$/ix
  validates_presence_of     :unencrypted_password, :unencrypted_password_confirmation, :if => :password_required?
  validates_length_of       :unencrypted_password, :unencrypted_password_confirmation, :minimum => 4, :if => :password_required?
  validates_confirmation_of :unencrypted_password, :if => :password_required?
  
  before_save :encrypt_password
  
  attr_accessor   :unencrypted_password, :unencrypted_password_confirmation
  attr_protected  :password
  
  serialize :prefs, Hash

  def self.authenticate(email, password)
    u = find :first, :conditions => ['email = ? and password = ?', email, self.encrypt(password)]
    u || nil
  end
  
  def encrypt(password)
    self.class.encrypt(password)
  end
  
  # Class methods
  
  def self.encrypt(password)
    Digest::SHA1.hexdigest(password)
  end
  
  protected
  
  def encrypt_password
    return if unencrypted_password.blank?
    self.password = self.class.encrypt(unencrypted_password)
  end
  
  def password_required?
    password.blank? || !unencrypted_password.blank?
  end
end
