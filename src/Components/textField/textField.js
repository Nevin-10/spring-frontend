import React, { useState, useEffect, useRef } from 'react';
import './textField.css';

const BlogApp = () => {
    const [posts, setPosts] = useState([]);
    const [newEntry, setNewEntry] = useState('');
    const [showTextField, setShowTextField] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch('https://dracox.azurewebsites.net/blog/getAll');
            const data = await response.json();
            setPosts(data.map(post => ({ ...post, editing: false, updatedEntry: post.entry })));
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://dracox.azurewebsites.net/blog/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ entry: newEntry }),
            });
            if (!response.ok) {
                throw new Error('Failed to create post');
            }
            setNewEntry('');
            setShowTextField(false);
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const handleDelete = async (postId) => {
        try {
            const response = await fetch(`https://dracox.azurewebsites.net/blog/delete/${postId}`, {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Failed to delete post');
            }
            fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleEdit = (postId, currentEntry) => {
        const updatedPosts = posts.map(post => {
            if (post.id === postId) {
                return { ...post, editing: true, updatedEntry: currentEntry };
            }
            return post;
        });
        setPosts(updatedPosts);
    };

    const handleUpdateEntryChange = (postId, updatedEntry) => {
        const updatedPosts = posts.map(post => {
            if (post.id === postId) {
                return { ...post, updatedEntry };
            }
            return post;
        });
        setPosts(updatedPosts);
    };

    const handleUpdate = async (postId, updatedEntry) => {
        try {
            const response = await fetch(`https://dracox.azurewebsites.net/blog/update/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ entry: updatedEntry }),
            });
            if (!response.ok) {
                throw new Error('Failed to update post');
            }
            fetchPosts();
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const Logo = () => (
        <div className="text-center mt-3" style={{ fontFamily: 'fantasy' }}>
            <h1>BLOG SPRING BOOT</h1>
        </div>
    );

    const TextField = () => {
        const inputRef = useRef(null); // Ref to manage input focus

        useEffect(() => {
            if (showTextField) {
                inputRef.current.focus(); // Focus on the input field when TextField is shown
            }
        }, []);

        return (
            <div className="row justify-content-center mt-3">
                <form onSubmit={(e) => handleCreate(e)}>
                    <input
                        ref={inputRef} // Ref to manage input focus
                        type="text"
                        className="form-control mr-2"
                        placeholder="Enter your blog content"
                        value={newEntry}
                        onChange={(e) => setNewEntry(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                        Submit
                    </button>
                    <button type="button" className="btn btn-secondary ml-2" onClick={() => setShowTextField(false)}>
                        Cancel
                    </button>
                </form>
            </div>
        );
    };

    return (
        <div className="container">
            <Logo />
            <div className="row justify-content-center mt-5">
                <button className="btn btn-primary mr-2" onClick={() => setShowTextField(true)}>
                    Create
                </button>
            </div>

            {showTextField && <TextField />}

            <div className="row mt-5">
                {posts.map((post) => (
                    <div key={post.id} className="col-md-6 offset-md-3 mb-3">
                        <div className="card">
                            <div className="card-body">
                                {post.editing ? (
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        value={post.updatedEntry}
                                        onChange={(e) => handleUpdateEntryChange(post.id, e.target.value)}
                                    />
                                ) : (
                                    <React.Fragment>
                                        <h5 className="card-title">Blog Post #{post.id}</h5>
                                        <p className="card-text">{post.entry}</p>
                                    </React.Fragment>
                                )}
                                <button className="btn btn-danger mr-2" onClick={() => handleDelete(post.id)}>
                                    Delete
                                </button>
                                {post.editing ? (
                                    <button
                                        className="btn btn-success"
                                        onClick={() => handleUpdate(post.id, post.updatedEntry)}
                                    >
                                        Update
                                    </button>
                                ) : (
                                    <button className="btn btn-success" onClick={() => handleEdit(post.id, post.entry)}>
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogApp;
