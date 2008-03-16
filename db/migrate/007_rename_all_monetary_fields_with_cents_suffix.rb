class RenameAllMonetaryFieldsWithCentsSuffix < ActiveRecord::Migration
  def self.up
    rename_column :task_lists, :default_rate, :default_rate_cents
    rename_column :tasks, :rate, :rate_cents
  end

  def self.down
    rename_column :task_lists, :default_rate_cents, :default_rate
    rename_column :tasks, :rate_cents, :rate
  end
end
