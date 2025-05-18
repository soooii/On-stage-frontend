import React, {useState, useRef, useCallback} from 'react';
import SocialPanel from "../LinkManagement/SocialPanel";
import {IoSettingsSharp} from "react-icons/io5";
import {MdVerified} from "react-icons/md";
import {AiFillDollarCircle} from "react-icons/ai";
import {useAxios} from "../../context/AxiosContext";
import {useLink} from "../../context/LinkContext";
import "./MyPage.css";
import { useForm } from 'react-hook-form';

const PHONE_REGEX = /^010\d{8}$/;
const CODE_REGEX = /\d{6}$/;

function MyPage() {
    const { profile } = useLink();
    const { axiosInstance } = useAxios();
    const [isVerifyModalOpen, setVerifyModalOpen] = useState(false);
    const [isSecessionModalOpen, setSecessionModalOpen] = useState(false);
    const modalBackground = useRef();
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');

    const closeModal = () => {
        if (isVerifyModalOpen) {
            setVerifyModalOpen(false);
        }
        if (isSecessionModalOpen) {
            setSecessionModalOpen(false);
        }
        setIsCodeSent(false);
        resetPhone();
        resetCode();
    }

    const {
        register: registerPhone,
        handleSubmit: handleSubmitPhone,
        formState: { errors: phoneError, isPhoneValid },
        reset: resetPhone,
    } = useForm({
        defaultValues: {phone: ''},
        mode: 'onChange',
    });

    const {
        register: registerCode,
        handleSubmit: handleSubmitCode,
        formState: { errors: codeError, isCodeValid },
        reset: resetCode,
    } = useForm({
        defaultValues: {verificationCode: ''},
        mode: 'onChange',
    });

    const sendCode = async(data) => {
        setPhoneNumber(data.phone);

        try {
            const response = await axiosInstance.post(`/api/user/send`, {
                phoneNumber: data.phone,
            });
            if (response.status === 200) {
                setIsCodeSent(true);
                alert('인증번호가 발송되었습니다!');
            }
        } catch (err) {
            console.error("오류 발생:", err);
        }
    }

    const checkCode = async(data) => {
        try {
            const response = await axiosInstance.post(`/api/user/verify`, {
                phoneNumber: phoneNumber,
                verificationCode: data.verificationCode,
            });
            if (response.status === 200) {
                alert('신청이 완료되었습니다!');
                window.location.reload();
                closeModal();
            }
        } catch (err) {
            console.error("오류 발생:", err);
        }
    }

    const deactivateAccount = async() => {
        try {
            const response = await axiosInstance.delete('/api/user')

            if (response.status === 200) {
                alert('계정이 삭제 처리되었습니다.');
                window.location.reload();
                closeModal();
            }
        } catch (err) {
            console.error("오류 발생:", err)
        }
    }

    return (
        <div className="mypage-wrapper">
            <div className="mypage-right">
                <h1><IoSettingsSharp className="mypage-text-icon"/> 프로필 관리</h1>
                <div className="mypage-divider">
                    <SocialPanel/>
                </div>

                <h1><MdVerified className="mypage-text-icon"/> 인증 정보</h1>

                <div className="mypage-divider">
                    <div className="badge-application-form">
                        {profile.verified === "VERIFIED" ? (
                            <div className="verified-info">
                                <h3>
                                    계정이 인증되었습니다.
                                </h3>
                                <p></p>
                            </div>
                        ) : profile.verified === "IN_PROGRESS" ? (
                            <div className="verified_info">
                                <h3>
                                    인증 신청이 완료되었습니다.
                                    <p>인증이 완료될 때까지 조금만 기다려주세요!</p>
                                </h3>
                            </div>
                            ) : (
                            <div className="verified-info">
                                <h3>
                                    아직 인증되지 않았습니다.
                                </h3>
                                <button className="mypage-modal-button" onClick={() => setVerifyModalOpen(true)}>
                                    문자 인증하기
                                </button>
                                {isVerifyModalOpen && (
                                        <div className="mypage-modal-container" ref={modalBackground} onClick={e => {
                                            if (e.target === modalBackground.current) {
                                                closeModal();
                                            }
                                        }}>
                                            <div className="mypage-modal-content">
                                                <h3>인증하기</h3>
                                                <form onSubmit={handleSubmitPhone(sendCode)} className="verify-form-phone">
                                                    <label htmlFor="tel">전화번호</label>
                                                    <div className="verify-input-container">
                                                        <input
                                                            type="tel"
                                                            name="tel"
                                                            placeholder="'-' 없이 입력해주세요."
                                                            {...registerPhone('phone', {
                                                                required: true,
                                                                pattern: {
                                                                    value: PHONE_REGEX,
                                                                    message: '01012345678 형식으로 입력해주세요.',
                                                                },
                                                            })
                                                        }
                                                        />
                                                        <button className="verify-send-button" type="submit">
                                                            전송
                                                        </button>
                                                    </div>
                                                    <div className="error-message">
                                                        {phoneError.phone ? <p>{phoneError.phone.message}</p> : <span>&nbsp;</span>}
                                                    </div>
                                                </form>
                                                    {isCodeSent && (
                                                        <form onSubmit={handleSubmitCode(checkCode)} className="verify-form">
                                                            <label htmlFor="verification-code">인증번호 입력</label>
                                                            <div className="verify-input-container">
                                                                <input
                                                                    type="text"
                                                                    name="verification-code"
                                                                    placeholder="인증번호를 입력하세요."
                                                                    {...registerCode('verificationCode', {
                                                                        required: true,
                                                                        pattern: {
                                                                            value: CODE_REGEX,
                                                                            message: '올바른 코드가 아닙니다.',
                                                                        },
                                                                    })
                                                                    }
                                                                />
                                                                <button className="verify-send-button" type="submit">
                                                                    확인
                                                                </button>
                                                                <div className="error-message">
                                                                    {codeError.verificationCode ?
                                                                        <p>{codeError.verificationCode.message}</p> :
                                                                        <span>&nbsp;</span>}
                                                                </div>
                                                            </div>
                                                        </form>
                                                    )}
                                                <button className="mypage-modal-button" onClick={closeModal}>
                                                    닫기
                                                </button>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        )}
                    </div>
                </div>

                {/*계정 인증을 완료하면 보이는 구독 상품(미구현)*/}
                {profile.verified === "VERIFIED" && (
                    <div>
                        <h1><AiFillDollarCircle className="mypage-text-icon"/>요금제 안내</h1>
                        <div className="mypage-divider">
                            <div className="pricing-section">
                                <h2>요금제 선택</h2>
                                <ul className="pricing-list">
                                    <li>
                                        <h3>무료 플랜</h3>
                                        <p>기본 기능 제공</p>
                                        <h6>월 $0</h6>
                                    </li>
                                    <li>
                                        <h3>프리미엄 플랜</h3>
                                        <p>인증 배지 및 추가 기능 제공</p>
                                        <h6>월 $9.99</h6>
                                    </li>
                                    <li>
                                        <h3>비즈니스 플랜</h3>
                                        <p>팀 기능 및 확장 지원</p>
                                        <h6>월 $29.99</h6>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/*계정 비활성화*/}
                {/*<div className="mypage-divider">*/}
                    <button className="mypage-secession-button" onClick={() => setSecessionModalOpen(true)}>계정 삭제</button>
                    {isSecessionModalOpen && (
                        <div className="mypage-modal-container" ref={modalBackground} onClick={e => {
                            if (e.target === modalBackground.current) {
                                closeModal();
                            }
                        }}>
                            <div className="mypage-modal-content">
                                <h3>계정 삭제</h3>
                                <p>정말 계정을 삭제하시겠어요?</p>
                                <button className="mypage-secession-button" onClick={deactivateAccount}>
                                    삭제하기
                                </button>
                                <button className="mypage-modal-button" onClick={closeModal}>
                                    닫기
                                </button>
                            </div>
                        </div>
                    )}
                {/*</div>*/}
            </div>
        </div>
    );
}

export default MyPage;