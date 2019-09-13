import express from 'express';
import $fn from './functions';
import * as AuthController from './auth/controllers';
import * as UserController from './user/controllers';
import * as DomainController from './domain/controllers';
import * as UploadController from './upload/controllers';
import * as CrawlerController from './crawler/controllers';
import * as SiteController from './site/controllers';
import * as CategoryController from './category/controllers';
import * as GroupController from './group/controllers';
import * as CampaignController from './campaign/controllers';
import * as ArticleController from './article/controllers';
import * as ErrorController from './error/controllers';
import {
    isAuth,
    isPermision,
    isUploadImagesMutiple,
    isUploadAudioMutiple,
    isUploadWithoutAuthen,
} from './auth/middleware';


const router = express.Router();

// Modules Home
// eslint-disable-next-line no-unused-vars
router.get('/', (req, res, next) => $fn.response.success(res));

// Auth Modules
router.get('/auth/me', isAuth, AuthController.me);
router.post('/auth/code/phone', AuthController.getCode);
router.post('/auth/verify/phone', AuthController.verifyCode);
// router.post('/auth/forgot', AuthController.forgotByPhone);
// router.post('/auth/login/social', AuthController.loginBySocial);

// Upload/Download Routes
router.post('/upload', [isUploadWithoutAuthen], UploadController.uploadTmp);
router.post('/user/upload/image', [isAuth, isUploadImagesMutiple], UploadController.uploadImage);
router.post('/user/upload/audio', [isAuth, isUploadAudioMutiple], UploadController.uploadAudio);

// User Routes
router.get('/user', [isAuth, isPermision('admin')], UserController.get);
router.get('/user/:id', UserController.getDetail);
router.post('/user/check', UserController.check);
router.post('/user/login', UserController.loginByEmail);
router.post('/user/add', [isAuth, isPermision('admin')], UserController.add);
router.post('/user/update', [isAuth, isPermision('admin')], UserController.update);
router.post('/user/delete', [isAuth, isPermision('admin')], UserController.deleteUser);
router.post('/user/restore', [isAuth, isPermision('admin')], UserController.restoreUser);
router.post('/user/campaign', [isAuth, isPermision('admin')], UserController.getCampaignByUser);

// Crawler Routes
router.post('/crawler/test', CrawlerController.crawler);

// Category Routes
router.get('/category', CategoryController.get);
router.get('/category/:id', CategoryController.getDetail);
router.post('/category', [isAuth, isPermision('admin')], CategoryController.add);
router.post('/category/update', [isAuth, isPermision('admin')], CategoryController.update);
router.post('/category/delete', [isAuth, isPermision('admin')], CategoryController.deleteCategory);
router.post('/category/restore', [isAuth, isPermision('admin')], CategoryController.restoreCategory);

// Group Routes
router.get('/group', GroupController.get);
router.get('/group/:id', GroupController.getDetail);
router.post('/group', [isAuth, isPermision('admin')], GroupController.add);
router.post('/group/update', [isAuth, isPermision('admin')], GroupController.update);
router.post('/group/delete', [isAuth, isPermision('admin')], GroupController.deleteGroup);
router.post('/group/restore', [isAuth, isPermision('admin')], GroupController.restoreGroup);


// Site Routes
router.get('/site', [isAuth, isPermision('user')], SiteController.get);
router.get('/site/:id', [isAuth, isPermision('user')], SiteController.getDetail);
router.post('/site', [isAuth, isPermision('mod')], SiteController.add);
router.post('/site/update', [isAuth, isPermision('mod')], SiteController.update);
router.post('/site/delete', [isAuth, isPermision('mod')], SiteController.deleteSite);
router.post('/site/restore', [isAuth, isPermision('mod')], SiteController.restoreSite);


// Campaign Routes
router.get('/campaign', [isAuth, isPermision('user')], CampaignController.get);
router.get('/campaign/:id', [isAuth, isPermision('user')], CampaignController.getDetail);
router.post('/campaign', [isAuth, isPermision('admin')], CampaignController.add);
router.post('/campaign/update', [isAuth, isPermision('admin')], CampaignController.update);
router.post('/campaign/delete', [isAuth, isPermision('admin')], CampaignController.deleteCampaign);
router.post('/campaign/restore', [isAuth, isPermision('admin')], CampaignController.restoreCampaign);

// Domain Routes
router.get('/domain', [isAuth, isPermision('user')], DomainController.get);
router.get('/domain/:id', [isAuth, isPermision('user')], DomainController.getDetail);
router.post('/domain', [isAuth, isPermision('mod')], DomainController.add);
router.post('/domain/update', [isAuth, isPermision('mod')], DomainController.update);
router.post('/domain/delete', [isAuth, isPermision('mod')], DomainController.deleteDomain);
router.post('/domain/restore', [isAuth, isPermision('mod')], DomainController.restoreDomain);


// Article Routes
router.get('/article', [isAuth, isPermision('user')], ArticleController.get);
router.post('/article/export', [isAuth, isPermision('mod')], ArticleController.exportData);
router.post('/article/search', ArticleController.search);
router.get('/article/:id', [isAuth, isPermision('user')], ArticleController.getDetail);
router.post('/article/count/total', [isAuth, isPermision('user')], ArticleController.getCountArticle);
//router.post('/article/delete', SiteController.deleteSite);

// Error Routes
router.get('/error', [isAuth, isPermision('mod')], ErrorController.get);
router.post('/error/retry', [isAuth, isPermision('mod')], ErrorController.retry);
router.get('/error/retry/all', ErrorController.retryAll);

export default router;
