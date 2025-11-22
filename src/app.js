const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const providerRoutes = require('./routes/providers');
const requestRoutes = require('./routes/requests');
const contactRoutes = require('./routes/contact');
const uploadRoutes = require('./routes/uploads');
const contentRoutes = require('./routes/content');
const dataRoutes = require('./routes/data');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts/:postId/comments', commentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/data', dataRoutes);
app.use('/api', contentRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;