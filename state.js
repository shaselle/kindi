// Request->ActiveRequest->Action>->State
const FETCH_REQUEST = (request) => (state) => ({
    ...state, loader: {
        ...state.loader,
        loading: true,
        status: `Requesting ${request.name}.`,
        progress: request.progress,
        description: "Fetching data from " + request.url
    }
});

const FETCH_SUCCEEDED = (request) => (state) => ({
    ...state, loader: {
        ...state.loader,
        status: `Requesting ${request.name} succeeded.`,
        progress: request.progress,
        description: `Fetching data from ${request.url} completed!`
    },
    [request.name]: request.data
});

const FETCH_FAILED = (request) => (state) => ({
    ...state, loader: {
        ...state.loader,
        status: `Requesting ${request.name} Failed.`,
        progress: request.progress,
        description: `Fetching data from ${request.url} Failed!`
    },
    error: {...request.error}
});

const FETCH_COMPLETED = (state) => ({
    ...state, loader: {
        ...state.loader,
        loading: false,
        status: "",
        progress: {...state.loader.progress, value: 0},
        description: ""
    },
});

export class State {
    get state() {
        return this._state;
    }

    constructor(initialState) {
        const state = initialState || {};
        const fetch = state.fetch || [];
        this._state = {
            ...state,
            fetch: [
                {
                    name: "manifest",
                    options: {},
                    url: `manifest.json`,
                },
                ...fetch
            ],
            loader: {
                icon: "icon.png",
                background: "blue",
                animation: "pulse",
                status: "Loading",
                description: "",
                progress: 0,
                ...state.loader,
            },
        };
        this.onCreate();
    }

    onCreate() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('sw.js')
                    .then((registration) => {
                        // Registration was successful
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    }, (err) => {
                        // registration failed :(
                        console.log('ServiceWorker registration failed: ', err);
                    });
            });
        }
        this.fetch();
    }

    fetch() {
        const requests = this.state.fetch;
        const rise = 100 / requests.length;
        this._state.loader = {
            ...this._state.loader,
            loading: true
        };
        requests.map(request => ({...request, progress: 0, description: ""}))
            .forEach(request => {
                this.dispatch(FETCH_REQUEST({
                    ...request,
                    progress: request.progress + rise,
                }));
                fetch(request.url, request.options)
                    .then(request => {
                        this.dispatch(FETCH_REQUEST({
                            ...request,
                            progress: request.progress + rise,
                        }));
                        return request.json();
                    })
                    .then(data => {
                        this.dispatch(FETCH_SUCCEEDED({...request, progress: request.progress + rise, data}));
                    })
                    .catch(error => {
                        this.dispatch(FETCH_FAILED({...request, error}));
                    }).finally(() => this.dispatch(FETCH_COMPLETED));
            });
    }

    // noinspection JSMethodCanBeStatic
    onLoading() {
        console.log("loading.....")
    }

    onUpdate() {

    }

    dispatch(action) {
        this._state = action(this.state);
        this.onUpdate();
    }
}