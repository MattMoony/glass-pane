<p align="center">
  <img alt="glass-pane" src="images/logo.png" width="125" height="125" />
</p>
<div align="center">
  <h1>Glass Pane</h1>
</div>
<p align="center">
  <img alt="GitHub" src="https://img.shields.io/github/license/MattMoony/glass-pane?style=for-the-badge">
  <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/MattMoony/glass-pane?style=for-the-badge">
  <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/MattMoony/glass-pane?style=for-the-badge&color=cecece">
</p>

---

> *Inspired by projects like [littlesis.org](https://littlesis.org/) this too aims to be "the involuntary social-media of the 1%". For now, mainly focused on Austrian politics and its surroundings.*

## Preview

Here are some preview images of what the page will look like eventually - however, keep in mind that this project is still undergoing major development (even though I kinda started working on this a long time ago).

![Preview](images/preview.gif)
***Image 1:** The search & person/organization info page.*

![Preview 2](images/preview3.png)
***Image 2:** A preview of what an extended network graph could look like.*

## ERD

Also, here is the *Entity Relationship Diagram* of the database behind this project - as exported using *DataGrip*.

**Also ...** I'll probably still change this in the future, as I'm not really happy about many things here, but... I'll stick with it for now :poop:. I mean, I just want to have something that works for now - I can always fix stuff later... right?!

![ERD](images/erd_datagrip.png)
***Image 2:** ER-diagram of the current database schema.*

## Docs

For more info, check the [Wiki](https://github.com/MattMoony/glass-pane/wiki).

## Vision

The general idea of this project is to make politics and the social networks of people with influence more accessible to the public. It should grant people a better insight on what shapes policy decisions and actions.

At the core of this lies people in the public interest and their connections to other people and memberships in organizations. This is what *glass pane* started out as. As the project progresses, it would be amazing to expand the areas it covers - extending it to bills passed in parliaments, people involved in those bills and working on some sort of querying mechanism to automatically determine possible beneficiaries of those bills, etc. This is just an example.

So yeah, you get the idea I hope. I'm always open for help and new ideas, since this is just something I'm working on in my free time as well, so feel free to contribute if you feel like you have the time and want to support this. <3

## Feature Ideas

Here a collection of ideas that would be really nice to have in a somewhat finished version of this project.

| Status | Name                 | Description                                                                                                                                                                                                                                                  |
| ------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ✅      | Socials              | Have an extra section for the social media accounts of people/organizations.                                                                                                                                                                                 |
| ❌      | Social media mutuals | It would also be amazing to integrate a tool such as my own [d4v1d](https://github.com/MattMoony/d4v1d) which could automatically crawl the social media account of people/organizations in order to import social media mutuals into the connections graph. |
| ❌      | Graph queries        | Being able to run queries on the graph of connections - e.g. "find the shortest path of connections between these two people", etc.                                                                                                                          |
| 🔃      | Tags                 | Assign tags to people that can then be used in queries as well - e.g. "neonazi", "lobbyist", "aristocrat", etc.                                                                                                                                              |
| ❌      | Timelines            | Instead of just writing everything in a entity's bio, actually split information up a bit - i.e. have a timeline of releveant events for this person/organization, etc.                                                                                      |
| ❌      | Embeddable           | Provide an endpoint that can be used for embedding graphs with selected entitys and connections - could be used e.g. if you wanted to write a blog post about a certain person's connections or something.                                                   |
| ❌      | RSS-Feeds            | Integrate RSS feeds from newspapers to automatically add new sources to people as news are published about them.                                                   |
