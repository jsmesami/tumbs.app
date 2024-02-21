# Tumbs.app

Create your artistic portfolio in minutes

## Development

### Prerequisites

* Python 3.12
* Postgres
* Nodejs

### Setup

    # prepare and activate virtual environment
    python -m venv venv
    source venv/bin/activate
    
    # install python dependencies
    pip install -U pip
    pip install -r requirements/dev.txt
    
    # prepare (+edit) and load env variables for development
    cp .env.dev .env
    source .env

    # prepare database
    psql -U postgres postgres -c "CREATE ROLE tumbs SUPERUSER LOGIN"
    psql -U postgres postgres -c "CREATE DATABASE tumbs OWNER=tumbs"
    
    # populate database
    python manage.py migrate
    python manage.py createsuperuser
    
    # install js dependencies
    npm install

    # run development servers
    npm run dev

### Run tests with coverage

To run the tests, check your test coverage, and generate an HTML coverage report:

    pip install -r requirements/test.txt
    npm run test

### Email Server

In development, it is often nice to be able to see emails that are being sent from your application. 
If you choose to use [Mailpit](https://github.com/axllent/mailpit) when generating the project a local SMTP server with a web interface will be available.

1.  [Download the latest Mailpit release](https://github.com/axllent/mailpit/releases) for your OS.

2.  Copy the binary file to the project root.

3.  Make it executable:

        $ chmod +x mailpit

4.  Spin up another terminal window and start it there:

        ./mailpit

5.  Check out <http://127.0.0.1:8025/> to see how it goes.

Now you have your own mail server running locally, ready to receive whatever you send it.

## License

Copyright © 2024 Ondřej Nejedlý

Distributed under the [Apache 2.0 License with Commons Clause License Condition 1.0](LICENSE.txt)
