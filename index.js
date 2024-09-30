const { v4: uuidv4 } = require('uuid');
const { format } = require('date-fns');
const { Client } = require('pg');
const cors = require('cors');
const express = require('express')
const port = 3000;
const app = express()
app.use(express.json());
app.use(cors());


const connection = new Client({
    host: process.env.DB_HOSTNAME,
    user: process.env.DB_USERNAME,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})
connection.connect(() => console.log("This is Connected running on port ", port));

// app.get('/networkStatus', async(req, res)=>{
//     try {
//         res.status(200).send("Backend is up")
//     } catch (error) {
//         res.status(500).send("Backend is down")
//     }
// })
app.post('/createUser', async (req, res) => {
    const query = `CREATE TABLE IF NOT EXISTS public.users
(
    firstname text COLLATE pg_catalog."default" NOT NULL,
    lastname text COLLATE pg_catalog."default" NOT NULL,
    email text COLLATE pg_catalog."default" NOT NULL,
    password text COLLATE pg_catalog."default" NOT NULL,
    useruuid text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (useruuid)
)
`
    await connection.query(query, values);
    res.json({
        msg: 'Table created '
    })
})
app.post('/SignUp', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const useruuid = uuidv4();
    try {
        const query = 'INSERT INTO users (firstName, lastName, email, password, useruuid) VALUES ($1,$2,$3,$4,$5)';
        const values = [firstName, lastName, email, password, useruuid];
        await connection.query(query, values);
        res.status(201).send("User Created Successfully");
    } catch (error) {
        console.error("Error Creating User", error);
    }
})


app.post('/Login', async (req, res) => {
    const { email } = req.body;
    try {
        const query = 'SELECT * from users WHERE email=$1';
        const values = [email];
        const checkIsUserThere = await connection.query(query, values);
        if (checkIsUserThere.rows.length > 0) {
            const user = checkIsUserThere.rows[0];
            res.status(200).json({ message: "User found", user: user });
        }
        else {
            res.status(401).send("Invalid Email Address");
        }
    } catch (error) {
        console.error("Error Creating User", error);
        res.status(500).send({
            msg: 'Error checking user',
            error: error
        });
    }
})


app.get('/blogs', async (req, res) => {
    try {
        const query = `SELECT 
    blogs.usertitle, 
    blogs.userinput, 
    blogs.bloguuid, 
    blogs.created_at, 
    users.firstname, 
    users.lastname, 
    users.email,
    users.useruuid
FROM 
    blogs
JOIN 
    users 
ON 
    blogs.useruuid = users.useruuid;`
        const blogs = await connection.query(query);
        if (blogs.rows.length > 0) {
            res.status(200).json({ message: "User found", blogs: blogs.rows });
        }
        else {
            res.status(401).send("Failed to fetch test");
        }
    } catch (error) {
        console.error("Error fetching blogs", error);
        res.status(500).json({
            msg: 'Error fetching blogs',
            error: error
        });
    }
})



app.post('/getFollowingUsersData', async (req, res) => {
    const { loggedinuseruuid } = req.body;
    try {
        console.log("97");

        const query = `SELECT users.firstname,
users.lastname
FROM users
JOIN userfollowing
ON users.useruuid= userfollowing.useruuid
WHERE loggedinuseruuid =$1;
`
        const values = [loggedinuseruuid]
        const blogs = await connection.query(query, values);
        if (blogs.rows.length > 0) {
            console.log("109");

            res.status(200).json({ message: "User found", blogs: blogs.rows });
        }
        else {
            res.status(401).send("Failed to fetch");
        }
    } catch (error) {
        console.error("Error fetching blogs", error);
        res.status(500).json({
            msg: 'Error fetching blogs',
            error: error
        });
    }
})


app.post('/getReplies', async (req, res) => {
    const { bloguuid } = req.body
    try {
        const query = 'SELECT * FROM replies WHERE bloguuid=$1';
        const values = [bloguuid]
        const fetchRepliesData = await connection.query(query, values);
        if (fetchRepliesData.rows.length > 0) {
            res.status(200).json({
                msg: "replies fetched",
                data: fetchRepliesData.rows,
            })
        } else {
            res.status(500).json({
                msg: "replies doesn't exist",
            })
        }
    } catch (error) {
        console.error("error while fetching replies", error);
    }
})


app.post('/likedBlog', async (req, res) => {
    const { bloguuid, useruuid } = req.body
    try {
        const query = 'INSERT INTO blogLiked (likedbloguuid,useruuid) VALUES($1,$2)';
        const values = [bloguuid, useruuid];
        const saveLikesData = await connection.query(query, values);
        res.status(200).send({ msg: "Like inserted" })
    } catch (error) {
        console.error("Error while fetching", error);
    }
})


app.post('/getLikes', async (req, res) => {
    const { useruuid } = req.body;
    try {
        const query = 'SELECT likedbloguuid FROM blogliked WHERE useruuid =$1'
        const values = [useruuid]
        const response = await connection.query(query, values);
        res.status(200).json({ msg: "liked blogs fetched", data: response.rows });
    } catch (error) {
        console.error("Error while fetching in backend", error);
    }
});


app.post('/addReplies', async (req, res) => {
    const { repliedinput, fullname, bloguuid } = req.body;
    const replyuuid = uuidv4();
    const now = new Date();
    const formattedDateTime = format(now, 'yyyy-MM-dd HH:mm:ss');
    try {
        const query = 'INSERT INTO replies (repliedinput,fullname,bloguuid,replyuuid, created_at) VALUES ($1,$2,$3,$4,$5)';
        const values = [repliedinput, fullname, bloguuid, replyuuid, formattedDateTime];
        const response = await connection.query(query, values);
        res.status(200).json({ msg: "Reply Saved", created_at: formattedDateTime, replyuuid: replyuuid });
    } catch (error) {
        console.error("Error while saving replies", error);
    }
});

app.post('/Postblog', async (req, res) => {
    const now = new Date();
    const formattedDateTime = format(now, 'yyyy-MM-dd HH:mm:ss');
    const { usertitle, userinput, useruuid } = req.body;
    const bloguuid = uuidv4();
    try {
        const query = 'INSERT INTO blogs (usertitle,userinput, useruuid, bloguuid , created_at)  VALUES($1,$2,$3,$4,$5)';
        const values = [usertitle, userinput, useruuid, bloguuid, formattedDateTime];
        await connection.query(query, values);
        res.status(200).json({
            msg: "Blog Created",
            blogid: bloguuid,
            created_time: formattedDateTime,
        });
    }
    catch (error) {
        console.error("Error Creating Blog", error);
        res.status(500).send('Error checking Blog');
    }
})


app.delete('/deleteBlog/:bloguuid/:userUuid', async (req, res) => {
    const { bloguuid, userUuid } = req.params;
    try {
        const query = 'DELETE FROM blogliked WHERE likedbloguuid = $1 AND useruuid = $2 RETURNING *';
        const values = [bloguuid, userUuid];
        const response = await connection.query(query, values);
        if (response.rows.length > 0) {
            res.status(200).json({ message: 'Blog unliked successfully', deletedBlog: response.rows });
        } else {
            response.status(404).json({ message: 'Blog or user not found' });
        }
    } catch (error) {
        console.error("Error deleting blog", error);
        res.status(500).json({ message: 'Error deleting blog' });
    }
});


app.post('/saveBookMarks', async (req, res) => {
    const { savedbloguuid, useruuid } = req.body
    try {
        const query = 'INSERT INTO blogsaved (savedbloguuid, useruuid) VALUES($1,$2);'
        const values = [savedbloguuid, useruuid];
        const response = await connection.query(query, values);
        res.status(200).json({ msg: "Bookmark saved succesfully" });
    } catch (error) {
        console.error("Error while fetching", error);
        res.status(500).json({ msg: 'error while inserting' });
    }
})


app.delete('/deleteBookMark/:bloguuid/:userUuid', async (req, res) => {
    const { bloguuid, userUuid } = req.params;
    try {
        const query = 'DELETE FROM blogsaved WHERE savedbloguuid = $1 AND useruuid = $2 RETURNING *';
        const values = [bloguuid, userUuid];
        const response = await connection.query(query, values);
        if (response.rows.length > 0) {
            res.status(200).json({ message: 'Blog unliked successfully', deletedBlog: response.rows });
        } else {
            res.status(404).json({ message: 'Blog or user not found' });
        }
    } catch (error) {
        console.error("Error deleting blog", error);
        res.status(500).json({ message: 'Error deleting blog' });
    }
});


app.post('/followUser', async (req, res) => {
    const { useruuid, loggedinuseruuidvalue } = req.body
    try {
        const query = 'INSERT INTO userfollowing (useruuid, loggedinuseruuid) VALUES($1,$2)';
        const values = [useruuid, loggedinuseruuidvalue]
        const response = await connection.query(query, values);
        res.status(200).json({ msg: "Following saved" })
    } catch (error) {
        console.error("Error while saving to database", error);
        res.status(500);
    }
})


app.delete('/unFollowedUser/:userUuid/:useruuid', async (req, res) => {
    const { useruuid, userUuid } = req.params;
    try {
        const query = 'DELETE FROM userfollowing WHERE loggedinuseruuid = $1 AND useruuid = $2 RETURNING *';
        const values = [userUuid, useruuid];
        const response = await connection.query(query, values);
        if (response.rows.length > 0) {
            res.status(200).json({ message: 'unfollowed user successfully', deletedBlog: response.rows });
        } else {
            res.status(404).json({ message: 'User is not following please check the parameters order or sequence' });
        }
    } catch (error) {
        console.error("Error deleting blog", error);
        res.status(500).json({ message: 'Error deleting blog' });
    }
});


app.post('/getBookMarks', async (req, res) => {
    const { useruuid } = req.body;
    try {
        const query = 'SELECT savedbloguuid FROM blogsaved WHERE useruuid =$1'
        const values = [useruuid]
        const response = await connection.query(query, values);
        res.status(200).json({ msg: "liked blogs fetched", data: response.rows });
    } catch (error) {
        console.error("Error while fetching in backend", error);
    }
});

app.post('/getSpecificBlog', async (req, res) => {
    const { bloguuid } = req.body;
    try {
        const query = 'SELECT * FROM blogs JOIN users ON blogs.useruuid= users.useruuid WHERE bloguuid=$1';
        const values = [bloguuid]
        const response = await connection.query(query, values);
        res.status(200).json({ msg: "Fetched Successfully", blogData: response.rows });
    } catch (error) {
        console.error("Error while fetching from backend", error);
    }
});


app.post('/getFollowers', async (req, res) => {
    const { useruuid } = req.body;
    try {
        const query = 'SELECT useruuid FROM userfollowing WHERE loggedinuseruuid =$1'
        const values = [useruuid]
        const response = await connection.query(query, values);
        res.status(200).json({ msg: "liked blogs fetched", data: response.rows });
    } catch (error) {
        console.error("Error while fetching in backend", error);
    }
});

app.post('/getBookMarksBlogs', async (req, res) => {
    const { useruuid } = req.body;

    try {
        const query = `
      SELECT *
      FROM blogs
      JOIN blogsaved ON blogs.bloguuid = blogsaved.savedbloguuid
      JOIN users ON blogsaved.useruuid = users.useruuid
      WHERE blogsaved.useruuid = $1
    `;
        const values = [useruuid];
        const savedBlogs = await connection.query(query, values);

        res.status(200).json({ data: savedBlogs.rows });
    } catch (error) {
        console.error("Error fetching saved blogs:", error);
        res.status(500).json({ message: 'Error fetching saved blogs' });
    }
});

app.post('/getUserDetails', async (req, res) => {
    const { loggedinuseruuid } = req.body;

    try {
        const query = `
       SELECT users.*
        FROM users
        JOIN userfollowing ON users.useruuid = userfollowing.loggedinuseruuid
        WHERE userfollowing.loggedinuseruuid = $1;
      `;
        const values = [loggedinuseruuid];
        const userdetials = await connection.query(query, values);


        res.status(200).json({ data: userdetials.rows });
    } catch (error) {
        console.error("Error fetching saved blogs:", error);
        res.status(500).json({ message: 'Error fetching saved blogs' });
    }
});

app.post('/getBlogsUsersData', async (req, res) => {
    const { getBlogsUsersData } = req.body;

    try {
        const query = `
       SELECT *
        FROM users
       WHERE useruuid = $1
      `;
        const values = [getBlogsUsersData];
        const userdetials = await connection.query(query, values);

        res.status(200).json({ data: userdetials.rows });
    } catch (error) {
        console.error("Error fetching saved blogs:", error);
        res.status(500).json({ message: 'Error fetching saved blogs' });
    }
});


app.listen(port);
