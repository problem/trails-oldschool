class RenameTypeColumn < ActiveRecord::Migration
  def self.up
    rename_column :log_entries, :type, :action
  end

  def self.down
    rename_column :log_entries, :action, :type
  end
end
