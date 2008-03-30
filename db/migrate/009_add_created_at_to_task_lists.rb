class AddCreatedAtToTaskLists < ActiveRecord::Migration
  def self.up
    add_column :task_lists, :updated_at, :datetime
  end

  def self.down
    remove_column :task_lists, :updated_at
  end
end
