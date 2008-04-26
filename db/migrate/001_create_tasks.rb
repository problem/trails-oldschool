class CreateTasks < ActiveRecord::Migration
  def self.up
    create_table :tasks do |t|
      t.integer   :task_list_id
      
      t.string    :description 
      t.integer   :duration_cache
      t.integer   :rate             #in pennies 
      t.string    :currency
      
      t.timestamps 
    end
  end

  def self.down
    drop_table :tasks
  end
end
