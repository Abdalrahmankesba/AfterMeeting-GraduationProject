using Microsoft.EntityFrameworkCore;
using Aftermeeting.Models;
using Aftermeeting.Models.Enums;

namespace Aftermeeting.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // ==================
        // DbSets (الجداول)
        // ==================
        public DbSet<User> Users { get; set; }
        public DbSet<Workspace> Workspaces { get; set; }
        public DbSet<WorkspaceUser> WorkspaceUsers { get; set; }
        public DbSet<Meeting> Meetings { get; set; }
        public DbSet<MeetingParticipant> MeetingParticipants { get; set; }
        public DbSet<MeetingTask> MeetingTasks { get; set; }
        public DbSet<TaskComment> TaskComments { get; set; }
        public DbSet<MeetingEmbedding> MeetingEmbeddings { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ==================
            // User
            // ==================
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique(); // الإيميل مش بيتكرر
            });

            // ==================
            // Workspace
            // ==================
            modelBuilder.Entity<Workspace>(entity =>
            {
                entity.Property(w => w.Type)
                      .HasConversion<string>(); // يتخزن كـ "Personal" / "Company"

                entity.HasOne(w => w.CreatedBy)
                      .WithMany(u => u.CreatedWorkspaces)
                      .HasForeignKey(w => w.CreatedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ==================
            // WorkspaceUser
            // ==================
            modelBuilder.Entity<WorkspaceUser>(entity =>
            {
                entity.Property(wu => wu.Role)
                      .HasConversion<string>();

                // مينفعش نفس اليوزر يبقى في نفس الـ Workspace أكتر من مرة
                entity.HasIndex(wu => new { wu.WorkspaceId, wu.UserId }).IsUnique();

                entity.HasOne(wu => wu.Workspace)
                      .WithMany(w => w.WorkspaceUsers)
                      .HasForeignKey(wu => wu.WorkspaceId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(wu => wu.User)
                      .WithMany(u => u.WorkspaceUsers)
                      .HasForeignKey(wu => wu.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ==================
            // Meeting
            // ==================
            modelBuilder.Entity<Meeting>(entity =>
            {
                entity.Property(m => m.Status)
                      .HasConversion<string>();

                entity.Property(m => m.InputType)
                      .HasConversion<string>();

                entity.HasOne(m => m.Workspace)
                      .WithMany(w => w.Meetings)
                      .HasForeignKey(m => m.WorkspaceId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(m => m.CreatedBy)
                      .WithMany()
                      .HasForeignKey(m => m.CreatedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<MeetingTask>(entity =>
            {
                entity.Property(t => t.Status)
                      .HasConversion<string>();

                entity.Property(t => t.Priority)
                      .HasConversion<string>();

                entity.HasOne(t => t.Meeting)
                      .WithMany(m => m.Tasks)
                      .HasForeignKey(t => t.MeetingId)
                      .OnDelete(DeleteBehavior.Cascade);

                // ✅ غير Cascade لـ NoAction هنا
                entity.HasOne(t => t.Workspace)
                      .WithMany()
                      .HasForeignKey(t => t.WorkspaceId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(t => t.AssignedTo)
                      .WithMany()
                      .HasForeignKey(t => t.AssignedToUserId)
                      .OnDelete(DeleteBehavior.SetNull)
                      .IsRequired(false);
            });

            // ==================
            // MeetingEmbedding
            // ==================
            modelBuilder.Entity<MeetingEmbedding>(entity =>
            {
                // كل Meeting ليها Embedding واحد بس
                entity.HasIndex(e => e.MeetingId).IsUnique();

                entity.HasOne(e => e.Meeting)
                      .WithOne(m => m.Embedding)
                      .HasForeignKey<MeetingEmbedding>(e => e.MeetingId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ==================
            // Notification
            // ==================
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.Property(n => n.Type)
                      .HasConversion<string>();

                entity.HasOne(n => n.User)
                      .WithMany(u => u.Notifications)
                      .HasForeignKey(n => n.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}