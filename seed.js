require("dotenv").config();
import mongoose from "mongoose";
import createDataSource from "./datasources";

const {
  MONGO_HOST: mongoHost,
  MONGO_PORT: mongoPort,
  MONGO_DB_NAME: mongoDBName
} = process.env;

(async () => {
  const data = {
    projects: [
      { name: "kfc", description: "kfc", pid: 1 },
      { name: "the coffee house", description: "The coffee house is a shop which sell cofee in VietNam", pid: 2 },
      { name: "honda", description: "honda is selling motobike and car", pid: 3 },
      { name: "vinamilk", description: "vinamilk is the biggest company which is selling milk in VietNam", pid: 4 },
      { name: "facebook", description: "facebook is social chat...", pid: 5 },
      { name: "cocacola", description: "cocacola is the name of the coke in USA", pid: 6 },
    ],
    topics: [
      {
        name: "cocacola topic",
        query: "cocacola topic",
        pid: [1, 4, 6],
      },
      { name: "kfc topic", query: "kfc topic", pid: [3, 2, 5] },
      { name: "honda topic", query: "honda topic", pid: [1, 3, 4] },
      { name: "vinamilk topic", query: "cty vinamilk", pid: [4] },
      { name: "facebook topic", query: "cty facebook", pid: [5, 6] },
    ]
  };

  const db = await mongoose.connect(
    `mongodb://${mongoHost}:${mongoPort}/${mongoDBName}`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
      if (err) console.log(err);
      console.log("db connecting");
    }
  );

  const builtSource = { ...createDataSource(db) };
  // =========== with topicIds =============
  // const dataTopics = data.topics.map(({ name, query }) => ({ name, query }));

  // let topics = await builtSource.Topic.collection.insertMany(
  //   dataTopics
  // );

  // topics = topics.map(topic => {
  //   const { _doc } = topic;
  //   const findTopic = data.topics.find(f => f.name == _doc.name);
  //   return {
  //     ..._doc,
  //     pid: findTopic.pid
  //   }
  // });

  // let dataProjects = data.projects.map(p => {
  //   const topicIds = topics.filter(t => t.pid.includes(p.pid)).map(i => i._id);
  //   const { name, description } = p;
  //   return {
  //     name,
  //     description,
  //     topicIds
  //   }
  // });

  // const projects = await builtSource.Project.collection.insertMany(
  //   dataProjects
  // );

  // =========== with projectIds =============
  let dataProjects = data.projects.map(p => ({ name: p.name, description: p.description }));
  let projects = await builtSource.Project.collection.insertMany(
    dataProjects
  );

  projects = projects.map(project => {
    const { _doc } = project;
    const findProject = data.projects.find(f => f.name == _doc.name);
    return {
      ..._doc,
      pid: findProject.pid
    };
  });

  const dataTopics = data.topics.map(t => {
    const projectIds = projects.filter(project => t.pid.includes(project.pid)).map(i => i._id);
    return {
      name: t.name,
      query: t.query,
      projectIds
    }
  });

  const topics = await builtSource.Topic.collection.insertMany(
    dataTopics
  );
})();
