
      
  <div id="readme" class="Box-body readme blob js-code-block-container p-5 p-xl-6 gist-border-0">
    <article class="markdown-body entry-content container-lg" itemprop="text"><h1><a id="user-content-graphql-hapi-server" class="anchor" aria-hidden="true" href="#graphql-hapi-server"><svg class="octicon octicon-link" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path></svg></a>graphql-hapi-server</h1>
<ol>
<li>Clone this repository</li>
<li><code>npm install</code></li>
<li><code>npx prisma generate</code></li>
<li><code>npx prisma migrate dev --preview-feature</code> &amp; set migration name to 'init'</li>
<li>in the graphql-hapi-server root folder <code>touch .env</code></li>
<li>Paste the following into .env:
<code>EMAIL_ADDRESS_CONFIGURED_IN_SEND_GRID="team@noisey.ca" #SENDGRID_API_KEY="..."       JWT_SECRET="..."</code>
<strong>Alternatively, you can create your own JWT_SECRET using the following command:</strong> <code>node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"</code></li>
<li><code>node seed-db.js</code></li>
<li>You can verify that the db was seeded with test data by running: <code>npx prisma studio</code></li>
</ol>
</article>
  </div>
