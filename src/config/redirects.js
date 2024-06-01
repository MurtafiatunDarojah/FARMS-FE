const redirectUris = [
    {
        domain: 'farmsadmin.citrapalu.net',
        uri: 'https://farmsadmin.citrapalu.net'
    },
    {
        domain: 'farmsadmin.gorontalominerals.com',
        uri: 'https://farmsadmin.gorontalominerals.com'
    },
    {
        domain: 'farmsadmin.lmrcs.com',
        uri: 'https://farms-admin.lmrcs.com'
    },
    {
        domain: 'farmsadmin.shsinergi.com',
        uri: 'https://farms-admin.shsinergi.com'
    },
    {
        domain: 'farmsadmindev.gorontalominerals.com',
        uri: 'https://farmsadmindev.gorontalominerals.com'
    },
    {
        domain: 'farmsadmindev.brmapps.com',
        uri: 'https://farmsadmindev.brmapps.com'
    },
    {
        domain: 'farmsadmindev.citrapalu.net',
        uri: 'https://farmsadmindev.citrapalu.net'
    },
    {
        domain: 'farmsadmindev.lmrcs.com',
        uri: 'https://farmsadmindev.lmrcs.com'
    },
    {
        domain: 'farmsadmindev.shsinergi.com',
        uri: 'https://farmsadmindev.shsinergi.com'
    },
    {
        domain: 'localhost',
        uri: 'http://localhost:3000'
    },
    {
        domain: 'master.d2agatbkcbzfun.amplifyapp.com',
        uri: 'https://farms-admin.brmapps.com'
    },
    {
        domain: 'hias.citrapalu.net',
        uri: 'https://farms-admin.citrapalu.net'
    },
    {
        domain: 'farmsadmin.brmapps.com',
        uri: 'https://farmsadmin.brmapps.com'
    },
    {
        domain: 'https://master.d1ss9qclzpb1pu.amplifyapp.com',
        uri: 'https://master.d1ss9qclzpb1pu.amplifyapp.com'
    },
];

let redirectUri = null;

redirectUris.forEach(redirect => {
    if (window.location.hostname === redirect.domain) {
        redirectUri = redirect.uri;
    }
});

if (!redirectUri) {
    redirectUri = 'http://localhost:3000';
}

export default redirectUri;
