class CreateLogEntries < ActiveRecord::Migration
  def self.up
    create_table :log_entries do |t|
      t.integer     :task_id
      
      t.string      :type
      t.datetime    :created_at
    end
  end

  def self.down
    drop_table :log_entries
  end
end
