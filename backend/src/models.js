const User = require('./modules/auth/user.model');
const Category = require('./modules/categories/category.model');
const Post = require('./modules/posts/post.model');
const Media = require('./modules/media/media.model');
const Attachment = require('./modules/attachments/attachment.model');
const Section = require('./modules/layout/section.model');

// Post belongs to Category
Post.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Post, { foreignKey: 'category_id', as: 'posts' });

// Post belongs to User (author)
Post.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
User.hasMany(Post, { foreignKey: 'author_id', as: 'posts' });

// Post has many Attachments
Post.hasMany(Attachment, { foreignKey: 'post_id', as: 'attachments' });
Attachment.belongsTo(Post, { foreignKey: 'post_id' });

// Attachment belongs to Media
Attachment.belongsTo(Media, { foreignKey: 'media_id', as: 'media' });
Media.hasMany(Attachment, { foreignKey: 'media_id' });

// Media belongs to User (uploader)
Media.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

module.exports = { User, Category, Post, Media, Attachment, Section };
