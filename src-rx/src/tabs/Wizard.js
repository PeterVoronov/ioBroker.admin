import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

import clsx from 'clsx';

// Icons
import {FaPlay as PlayIcon} from 'react-icons/all';
import CheckIcon from '@material-ui/icons/Check';
import WizardPasswordTab from '../components/WizardPasswordTab';
import WizardLicenseTab from '../components/WizardLicenseTab';
import WizardFinishImage from '../assets/wizard-finish.jpg';
import WizardWelcomeImage from '../assets/wizard-welcome.jpg';
import WizardSettingsTab from '../components/WizardSettingsTab';

const styles = theme => ({
    dialog: {
        height: '100%',
        maxHeight: '100%',
        maxWidth: '100%',
    },
    paper: {
        width: '100%',
        height: 'calc(100% - ' + theme.mixins.toolbar.minHeight + 'px)',
        overflow: 'hidden'
    },
    content: {
        textAlign: 'center',
    },
    tabPanel: {
        width: '100%',
        overflow: 'hidden',
        height: 'calc(100% - ' + theme.mixins.toolbar.minHeight + 'px)',
    },
    fullHeightWithoutToolbar: {
        height: 'calc(100% - ' + theme.mixins.toolbar.minHeight + 'px)',
        width: '100%',
        overflow: 'auto',
    },
    finishBackground: {
        backgroundImage: 'url(' + WizardFinishImage + ')',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'auto',
        backgroundPosition: 'center',
    },
    welcomeBackground: {
        backgroundImage: 'url(' + WizardWelcomeImage + ')',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'auto',
        backgroundPosition: 'center',
    },
    grow: {
        flexGrow: 1,
    },
});

class Wizard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            exitAvailable: false,
            activeStep: 0,
        };

        this.password = '';

        this.lastPage = 1;
    }

    renderWelcome() {
        return <div className={ clsx(this.props.classes.paper, this.props.classes.welcomeBackground) }>
            <div className={ this.props.classes.fullHeightWithoutToolbar }>

            </div>
            <Toolbar>
                <div  className={ this.props.classes.grow }/>
                <Button
                    variant="contained"
                    color="secondary"
                    focused
                    onClick={ () =>
                        this.props.socket.getSystemConfig(true)
                            .then(obj =>
                                this.setState( {activeStep: this.state.activeStep + 1 + (obj.common.licenseConfirmed ? 1 : 0) }))
                    }>
                    { this.props.t('Start wizard') } <PlayIcon/></Button>
                <div  className={ this.props.classes.grow }/>
            </Toolbar>
        </div>;
    }

    renderLicense() {
        return <WizardLicenseTab
            t={ this.props.t }
            socket={ this.props.socket }
            themeName={ this.props.themeName }
            onDone={ () => {
                this.props.socket.getSystemConfig(true)
                    .then(obj => {
                        obj.common.licenseConfirmed = true;
                        return this.props.socket.setSystemConfig(obj);
                    })
                    .then(() => this.setState( {activeStep: this.state.activeStep + 1 }));
            } }
        />;
    }
    renderPassword() {
        return <WizardPasswordTab
            t={ this.props.t }
            socket={ this.props.socket }
            themeName={ this.props.themeName }
            onDone={ pass =>
                this.props.socket.changePassword('admin', pass)
                    .then(() =>
                        this.setState( {activeStep: this.state.activeStep + 1 }))}
        />;
    }
    renderSettings() {
        return <WizardSettingsTab
            t={ this.props.t }
            socket={ this.props.socket }
            themeName={ this.props.themeName }
            onDone={settings =>
                this.props.socket.getSystemConfig(true)
                    .then(obj => {
                        Object.assign(obj.common, settings);
                        return this.props.socket.setSystemConfig(obj);
                    })
                    .then(() => this.setState({activeStep: this.state.activeStep + 1}))
            }
        />;
    }
    renderFinish() {
        return <div className={ clsx(this.props.classes.paper, this.props.classes.finishBackground) }>
            <div className={ this.props.classes.fullHeightWithoutToolbar }>

            </div>
            <Toolbar>
                <div  className={ this.props.classes.grow }/>
                <Button variant="contained" color="secondary" focused onClick={ () => this.props.onClose() }><CheckIcon/>{ this.props.t('Finish') }</Button>
                <div  className={ this.props.classes.grow }/>
            </Toolbar>
        </div>;
    }

    render() {
        return <Dialog
            className={ this.props.classes.dialog }
            open={ true }
            onClose={ () => {} }
            fullWidth={ true }
            fullScreen={ true }
            aria-labelledby="wizard-dialog-title"
        >
            <DialogTitle id="wizard-dialog-title">{ this.props.t('Initial setup') }</DialogTitle>
            <DialogContent className={ this.props.classes.content }>
                <AppBar position="static">
                    <Stepper activeStep={ this.state.activeStep }>
                        <Step><StepLabel>{ this.props.t('Welcome') }</StepLabel></Step>
                        <Step><StepLabel>{ this.props.t('License agreement') }</StepLabel></Step>
                        <Step><StepLabel>{ this.props.t('Password') }</StepLabel></Step>
                        <Step><StepLabel>{ this.props.t('Finish') }</StepLabel></Step>
                    </Stepper>
                </AppBar>
                {this.state.activeStep === 0 ? <div className={ this.props.classes.tabPanel }>{ this.renderWelcome()  }</div> : null }
                {this.state.activeStep === 1 ? <div className={ this.props.classes.tabPanel }>{ this.renderLicense()  }</div> : null }
                {this.state.activeStep === 2 ? <div className={ this.props.classes.tabPanel }>{ this.renderPassword() }</div> : null }
                {this.state.activeStep === 3 ? <div className={ this.props.classes.tabPanel }>{ this.renderSettings() }</div> : null }
                {this.state.activeStep === 4 ? <div className={ this.props.classes.tabPanel }>{ this.renderFinish()   }</div> : null }
            </DialogContent>
            <DialogActions>
            </DialogActions>
        </Dialog>;
    }
}

Wizard.propTypes = {
    t: PropTypes.func,
    lang: PropTypes.string,
    socket: PropTypes.object,
    onClose: PropTypes.func,
};

export default withWidth()(withStyles(styles)(Wizard));